import vine from '@vinejs/vine'

export const job_validator = vine.compile(
    vine.object({
        'station_slug': vine.string(),
        'api_url': vine.string(),
        'username': vine.string(),
        'password': vine.string(),
    })
);