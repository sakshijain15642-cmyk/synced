from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Incident, TeamMember, User
from app.schemas import IncidentCreate, IncidentOut, IncidentUpdate, Status

router = APIRouter(prefix="/teams/{team_id}/incidents", tags=["incidents"])


def require_team_member(db: Session, team_id: int, user_id: int) -> None:
    """Stop the request unless this user belongs to the team."""
    if db.get(TeamMember, (user_id, team_id)) is None:
        # 404, not 403: we don't reveal whether the team exists to outsiders.
        raise HTTPException(status_code=404, detail="Team not found")

def get_team_incident(db: Session, team_id: int, incident_id: int) -> Incident:
    """Fetch an incident, but only if it really belongs to this team."""
    incident = db.get(Incident, incident_id)
    if incident is None or incident.team_id != team_id:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

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

@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(
    team_id: int,
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_team_member(db, team_id, current_user.id)
    return get_team_incident(db, team_id, incident_id)


@router.patch("/{incident_id}", response_model=IncidentOut)
def update_incident(
    team_id: int,
    incident_id: int,
    data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_team_member(db, team_id, current_user.id)
    incident = get_team_incident(db, team_id, incident_id)

    changes = data.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    if any(value is None for value in changes.values()):
        raise HTTPException(status_code=422, detail="Fields cannot be null")

    for field, value in changes.items():
        setattr(incident, field, value)
    db.commit()
    db.refresh(incident)
    return incident