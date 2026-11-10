FROM golang:1.27.3-alpine AS build
WORKDIR /src
RUN apk add --no-cache ca-certificates
COPY go.mod go.sum ./
RUN go mod download
COPY shared/ ./shared/
COPY services/trip-service/ ./services/trip-service/
RUN CGO_ENABLED=0 go build -o /trip-service ./services/trip-service/cmd

FROM scratch
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=build /trip-service /trip-service
USER 65532:65532
EXPOSE 50051
ENTRYPOINT ["/trip-service"]