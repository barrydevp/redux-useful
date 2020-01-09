// const handle = {
//   warn: text => console.warn(text),
//   log: text => console.log(text),
//   error: text => console.error(text)
// };

// const doNotThing = () => {};

// const createLog = isDev => {
//   return handle.map(han => (isDev ? han : doNotThing));
// };

// export default createLog(true);

export const warn = text => console.warn(text);
export const log = text => console.log(text);
export const error = text => console.error(text);
