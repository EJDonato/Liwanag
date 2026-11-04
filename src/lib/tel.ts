// "(02) 8804-4673" -> "tel:0288044673". Keeps a leading + and drops spaces, dashes and brackets.
export const telHref = (number: string) => `tel:${number.replace(/[^\d+]/g, "")}`;
