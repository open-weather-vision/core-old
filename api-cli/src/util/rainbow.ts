import chalk from "chalk"

// copied from : https://github.com/johno/chalk-rainbow#readme
export default function rainbow (str: string) {
    if (typeof str !== 'string') {
      throw new TypeError('chalk-rainbow expected a string')
    }
  
    const letters = str.split('')
    const colors: any = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta']
    const colorsCount = colors.length
  
    return letters.map((l, i) => {
      const color = colors[i%colorsCount]
      return (chalk as any)[color](l)
    }).join('')
  }