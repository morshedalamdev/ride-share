FROM golang:1.27.3-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
COPY shared/ ./shared/
COPY services/api-gateway/ ./services/api-gateway/
RUN CGO_ENABLED=0 go build -o /api-gateway ./services/api-gateway

FROM scratch
COPY --from=build /api-gateway /api-gateway
USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/api-gateway"]