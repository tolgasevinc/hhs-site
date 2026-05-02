type PagesFunctionContext = {
  env: {
    DB: D1Database
    ASSETS: R2Bucket
  }
}

export const onRequestGet = async ({ env }: PagesFunctionContext) => {
  return Response.json({
    ok: true,
    db: Boolean(env.DB),
    assets: Boolean(env.ASSETS),
  })
}
