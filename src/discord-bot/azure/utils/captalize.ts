const captalize = (text: string): string => {
  return text.split(" ").map(element => element.charAt(0).toUpperCase() + element.slice(1).toLowerCase()).join(" ")
}

export default captalize