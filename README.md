# How to use KafkaJS
`dc up -d`

 # How install kcat
 brew install kcat

# Install kafkajs-dlq
git clone https://github.com/Nevon/kafkajs-dlq.git

# How show topics
`kcat -L -b kafka:9092`

# How Consume all messages
`kcat -C -b localhost:9092 -t topic1`

# How list all topics and sort
`kcat -b kafka:9092 -L -J | jq '.topics[].topic' | sort`

# How to log by service name
`docker logs -t -f kafkajs-demo-consumer-2`

# Manual run Consumer
`time npm run start`

# Manual run Producer
`time npm run start`

# Performance testing x 1
Shutting down
Processed 386

real    0m16.647s
user    0m0.728s
sys     0m0.142s

386 / 16 = 24/sec

Shutting down
Processed 1210

real    0m31.254s
user    0m1.137s
sys     0m0.195s

1210 / 31 = 39/sec

# x 2
Shutting down
Processed 219

real    0m26.445s
user    0m0.707s
sys     0m0.145s
219 / 26 = 8/sec

Shutting down
Processed 227

real    0m18.462s
user    0m0.696s
sys     0m0.145s
227 / 18 = 12/sec

# x1 10s
Caught SIGTERM
Shutting down
Processed 3259

# x2 10s
Caught SIGTERM
Shutting down
Processed 1619

Caught SIGTERM
Shutting down
Processed 834

# Prefilled
Caught SIGTERM
Shutting down
Processed 15052

Caught SIGTERM
Shutting down
Processed 15781


## 30s producer
Caught SIGTERM
Shutting down
Messages sent 15042

## 30s consumer
Caught SIGTERM
Shutting down
Processed 13707


## x2 30s producer
Caught SIGTERM
Shutting down
Messages sent 9543

## x2 consumer
Caught SIGTERM
Shutting down
Processed 4144

Caught SIGTERM
Shutting down
Processed 4673

## x2 30s
Shutting down
Messages sent 10128

Shutting down
Processed 4234

Shutting down
Processed 4905

## x1 30s
Shutting down
Messages sent 18322

Shutting down
Processed 18322

# Run for 30s
`timeout 35 node ./dist/index.js example-topic`
Caught SIGTERM
Shutting down
Messages sent 20948

`timeout 30 node ./dist/index.js example-topic example`
Caught SIGTERM
Shutting down
Processed 14657

# x2
`timeout 32 node ./dist/index.js example-topic`
Caught SIGTERM
Shutting down
Messages sent 10539

`timeout 30 node ./dist/index.js example-topic example`
Caught SIGTERM
Shutting down
Processed 4196

Caught SIGTERM
Shutting down
Processed 5377