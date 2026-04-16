FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY services/authservice/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY services/authservice/ /app/

EXPOSE 8000

CMD ["bash","-lc","python -u manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
