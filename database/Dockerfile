# 使用官方 PostgreSQL 镜像
FROM postgres:16

# 设置环境变量（可在 docker run / compose 中覆盖）
ENV POSTGRES_DB=secondhand
ENV POSTGRES_USER=appuser
ENV POSTGRES_PASSWORD=apppassword

ENV TZ=Asia/Shanghai

# 将初始化 SQL 拷贝到指定目录
# 容器首次启动时会自动执行
COPY init.sql /docker-entrypoint-initdb.d/

# 暴露 PostgreSQL 端口
EXPOSE 5432
