export const tagsRemover: (str: string) => string = (str: string) =>
  str
    .replace(/<bg_err>/g, "")
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
