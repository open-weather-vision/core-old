import app from "@adonisjs/core/services/app";

export default class APIController{
    async shutdown(){
        setTimeout(() => {
            app.terminate();
        }, 1000);

        return {
            success: true,
        }
    }
}