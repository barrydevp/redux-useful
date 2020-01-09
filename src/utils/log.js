import invariant from "invariant";
import warning from "warning";

export const warn = text => invariant(true, text);
export const log = text => console.log(text);
export const error = text => warning(true, text);
export {
  warning,
  invariant
}
