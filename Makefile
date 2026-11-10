PROTO_DIR := proto
PROTO_SRC := $(wildcard $(PROTO_DIR)/*.proto)
GO_OUT := .

.PHONY: generate-proto
generate-proto:
	protoc --proto_path=$(PROTO_DIR) \
		--go_out=$(GO_OUT) --go_opt=module=github.com/morshedalamdev/ride-share \
		--go-grpc_out=$(GO_OUT) --go-grpc_opt=module=github.com/morshedalamdev/ride-share \
		$(PROTO_SRC)