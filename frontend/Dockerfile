# 1. Base image chuno (Python 3.11 ya jo tum use kar rahe ho)
FROM python:3.11-slim

# 2. Container ke andar folder banao
WORKDIR /app

# 3. requirements file copy karo aur install karo
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Baaki saara backend code copy karo
COPY . .

# 5. Port expose karo (Render ya cloud ke liye 10000 standard hai)
EXPOSE 10000

# 6. FastAPI start karne ki command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]