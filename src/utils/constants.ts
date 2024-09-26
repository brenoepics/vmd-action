export const LOW_HEALTH_THRESHOLD: number = 75;
export const MEDIUM_HEALTH_THRESHOLD: number = 85;
export const OK_HEALTH_THRESHOLD: number = 95;
export const tagsRemover: (str: string) => string = (str: string) => str.replace(/<bg_err>/g, "")
  .replace(/<bg_warn>/g, "")
  .replace(/<bg_info>/g, "")
  .replace(/<bg_ok>/g, "")
  .replace(/<\/bg_err>/g, "")
  .replace(/<\/bg_warn>/g, "")
  .replace(/<\/bg_info>/g, "")
  .replace(/<\/bg_ok>/g, "")
  .replace(/<text_warn>/g, "")
  .replace(/<text_info>/g, "")
  .replace(/<\/text_warn>/g, "")
  .replace(/<\/text_info>/g, "");
