set -o allexport; source .env; set +o allexport
./minio server data --console-address ":35187" --certs-dir /root/.minio/certs