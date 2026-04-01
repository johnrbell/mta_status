import { f as fetchTrainData } from "../../chunks/mta.js";
async function load() {
  const data = await fetchTrainData();
  return {
    trains: data.trains,
    cacheTime: data.cacheTime.toISOString()
  };
}
export {
  load
};
