export async function myfetch(params: string, opts?: any) {
  const response = await fetch(params, opts)
  if (!response.ok) {
    try {
      const res = await response.text()
      let msg = ''
      try {
        const json = JSON.parse(res)
        msg = json.message
      } catch (e) {
        msg = res
      }
      throw new Error(`HTTP ${response.status} ${msg}`)
    } catch (e) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }
  }
  return response
}

export async function myfetchjson(params: string, opts?: any) {
  const res = await myfetch(params, opts)
  return res.json()
}
