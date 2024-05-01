export function createCustomEvent<T>(eventName: string, eventData: T) {
  const event = new CustomEvent(eventName, { detail: eventData });
  document.dispatchEvent(event);
}

// Function to listen to the custom event
export function listenToCustomEvent<T>(
  eventName: string,
  callback: (event: CustomEvent<T>) => void
) {
  document.addEventListener(eventName, (evt) => {
    callback(evt as CustomEvent<T>);
  });
}
