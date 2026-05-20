from celery import Celery

from app.core.config import settings

celery = Celery(
    "storytunes",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.workers.tasks"],
)

# PDD §24 queue priorities.
celery.conf.update(
    task_default_queue="normal",
    task_routes={
        "app.workers.tasks.send_*": {"queue": "high"},
        "app.workers.tasks.start_production_pipeline": {"queue": "high"},
    },
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)
