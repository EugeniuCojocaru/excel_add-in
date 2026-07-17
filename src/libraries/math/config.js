import { create, all } from "mathjs";

const math = create(all);

math.config({
  number: "BigNumber",
  precision: 64,
});

export default math;
