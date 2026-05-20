from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import AdminUser, Db
from app.models.business import Sample
from app.schemas.sample import SampleCreate, SampleOut

router = APIRouter(prefix="/samples", tags=["samples"])


@router.get("", response_model=list[SampleOut])
def list_samples(db: Db) -> list[Sample]:
    return list(db.execute(select(Sample).where(Sample.is_active.is_(True))).scalars())


@router.post("", response_model=SampleOut, status_code=201)
def create_sample(payload: SampleCreate, db: Db, _: AdminUser) -> Sample:
    sample = Sample(**payload.model_dump())
    db.add(sample)
    db.commit()
    db.refresh(sample)
    return sample


@router.delete("/{sample_id}", status_code=204)
def delete_sample(sample_id: str, db: Db, _: AdminUser) -> None:
    sample = db.get(Sample, sample_id)
    if sample is None:
        raise HTTPException(404, "Sample not found")
    db.delete(sample)
    db.commit()
