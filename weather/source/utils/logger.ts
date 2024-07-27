import {createLogger, format, transports} from 'winston';

const logger = createLogger({
	level: 'info',
	format: format.prettyPrint(),
	defaultMeta: {service: 'user-service'},
	transports: [new transports.File({filename: 'logs.log'})],
});

export default logger;
