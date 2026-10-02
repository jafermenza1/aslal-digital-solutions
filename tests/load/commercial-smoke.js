import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: { smoke: { executor: "constant-vus", vus: 5, duration: "60s" } },
  thresholds: { http_req_failed: ["rate<0.01"], http_req_duration: ["p(95)<800"] },
};

const base = __ENV.BASE_URL;
if (!base) throw new Error("BASE_URL is required");

function commercialSmoke() {
  const health = http.get(base + "/api/health?deep=0");
  const home = http.get(base + "/");
  check(health, { "health 200": (r) => r.status === 200 });
  check(home, { "home 200": (r) => r.status === 200 });
  sleep(1);
}

export default commercialSmoke;
