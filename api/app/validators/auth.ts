import vine from '@vinejs/vine'

export const login_validator = vine.compile(
    vine.object({
        username: vine.string(),
        password: vine.string(),
    })
);
