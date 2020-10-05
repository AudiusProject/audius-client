export const sendPostMessage = (data) => {
  if(typeof(data) !== 'object') return;
  if(window.parent !== window){
    let message = data
    message.from = 'audiusembed'
    window.parent.postMessage(JSON.stringify(message), '*')
  }
}
