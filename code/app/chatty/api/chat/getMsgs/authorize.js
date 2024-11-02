
/**
 * 
 * @type {import("@based/functions").Authorize}
 */
export default async (_based, _ctx, _name, _payload) => {
    if(!_ctx.session.authState.token) {
        return false
    }

    

    return true
}
