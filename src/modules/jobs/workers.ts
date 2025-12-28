import rabbitMQ from "./rabbitmq";
import vm from "vm";

export async function BackgroundWorker() {
  await rabbitMQ.consume<{ payload: { code: string } }>(
    "jobs",
    "CODE_EXECUTION",
    async (data, msg) => {
      vm.runInNewContext(data.payload.code, {
        console,
      });
    }
  );
}
