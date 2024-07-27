import {useApp, useInput, Box, Text} from 'ink';
import React from 'react';

export default function Logo() {
	return (
		<Box marginBottom={1}>
			<Text bold color={'blueBright'}>
				{`                       _     _             
                      (_)   (_)            
   _____      ____   ___ ___ _  ___  _ __  
  / _ \\ \\ /\\ / /\\ \\ / / / __| |/ _ \\| '_ \\ 
 | (_) \\ V  V /  \\ V /| \\__ \\ | (_) | | | |
  \\___/ \\_/\\_/    \\_/ |_|___/_|\\___/|_| |_|
`}
			</Text>
		</Box>
	);
}
