import LoginException from "#exceptions/login_exception";
import { HttpContextWithSession } from "#middleware/user_authentication_middleware";
import Session from "#models/session";
import User from "#models/user";
import { login_validator } from "#validators/auth";
import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";
import { randomUUID } from "crypto";

export default class AuthController{
    async login(ctx: HttpContext){
        const payload = await login_validator.validate(ctx.request.body());

        const user = await User.query().where('name', payload.username).first();

        if(!user){
            throw new LoginException();
        }

        if(!await hash.verify(user?.password!, payload.password)){
            throw new LoginException();
        }

        const session = await Session.create({
            token: randomUUID(),
            user_id: user.id, 
        }) 

        return {
            success: true,
            data: {
                auth_token: session.token,
            }
        }
    } 

    async logout(ctx: HttpContext){
        const auth_ctx = (ctx as HttpContextWithSession); 
        await auth_ctx.session.delete();

        return {
            success: true,
        }
    } 
}