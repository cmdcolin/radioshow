export async function myfetch(params: string, opts?: any) {
  const response = await fetch(params, opts)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  return response
}

export async function myfetchjson(params: string, opts?: any) {
  const res = await myfetch(params, opts)
  return res.json()
}
