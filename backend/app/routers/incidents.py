from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Incident, TeamMember, User
from app.schemas import IncidentCreate, IncidentOut, Status

router = APIRouter(prefix="/teams/{team_id}/incidents", tags=["incidents"])


def require_team_member(db: Session, team_id: int, user_id: int) -> None:
    """Stop the request unless this user belongs to the team."""
    if db.get(TeamMember, (user_id, team_id)) is None:
        # 404, not 403: we don't reveal whether the team exists to outsiders.
        raise HTTPException(status_code=404, detail="Team not found")


@router.post("", response_model=IncidentOut, status_code=201)
def create_incident(
    team_id: int,
    data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_team_member(db, team_id, current_user.id)
    incident = Incident(
        team_id=team_id,
        created_by=current_user.id,
        title=data.title,
        description=data.description,
        severity=data.severity,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)  # loads the database-generated id, status and timestamps
    return incident


@router.get("", response_model=list[IncidentOut])
def list_incidents(
    team_id: int,
    status: Status | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_team_member(db, team_id, current_user.id)
    stmt = select(Incident).where(Incident.team_id == team_id)
    if status is not None:
        stmt = stmt.where(Incident.status == status)
    stmt = (
        stmt.order_by(Incident.created_at.desc(), Incident.id.desc())
        .limit(limit)
        .offset(offset)
    )
    return db.scalars(stmt).all()