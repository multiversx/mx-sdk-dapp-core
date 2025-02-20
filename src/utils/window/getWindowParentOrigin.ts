export function getWindowParentOrigin() {
  try {
    if (document.referrer) {
      return new URL(document.referrer).origin;
    }

    const ancestorOrigins = window.location.ancestorOrigins;

    if (ancestorOrigins.length < 1) {
      return '';
    }

    return new URL(ancestorOrigins[ancestorOrigins.length - 1]).origin;
  } catch (e) {
    console.error(e);
    return '';
  }
}
