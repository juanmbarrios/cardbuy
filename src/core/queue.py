"""Queue integration for background tasks."""

import logging
from redis import Redis
from rq import Queue

from config.settings import REDIS_URL

logger = logging.getLogger(__name__)

redis_client = Redis.from_url(REDIS_URL)
work_queue = Queue("default", connection=redis_client)


def enqueue_job(func, *args, **kwargs):
    job = work_queue.enqueue(func, *args, **kwargs)
    logger.info("Enqueued job %s with id %s", func.__name__, job.id)
    return job
