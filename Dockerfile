# Duetto 自己构建用的镜像
# 目的：把 frontend/ 里的静态文件一起打进镜像，不然服务起得来但前端打不开
FROM node:24-slim

WORKDIR /app

# 先装依赖，利用镜像层缓存
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 服务端代码
COPY server ./server

# 前端静态文件（index.html 在 frontend/pkg/ 里）
COPY frontend ./frontend

ENV NODE_ENV=production
ENV PORT=4183

EXPOSE 4183

CMD ["node", "server/index.mjs"]
