# core

This repository contains the _official open weather vision (owvision) core engine_. This includes the **REST api** together with the corresponding **CLI** and the **abstract recorder interface**, which can be used to connect any weather station and any sensor.

⚠️ Development just started - there is no offical working version yet.

![Overview](./core-diagram.svg)
_This image shows an overview of the open weather vision system_. Every red component is a docker container.

## CLI Usage

The `owvision` cli is an easy tool to manage and configure your weather stations. Internally it just calls the endpoints of the REST api.

### Initial Set Up

#### 1. Install The Interface

owvision needs an interface that allows it to communicate with your weather station. This interface is basically a single javascript file that extends the _WeatherStationInterface_ class. To register this javascript file execute:

```markdown
owvision install-interface <path-to-js-file> <interface-name>
```

#### 2. Connect (And Configure) Your Weather Station

After that you can use this interface to connect to your weather station. You have to give your station a name and you can select your favorite units. Added to that you can set each sensor's update times. Your selected interface may require more configuration (e.g. a `COM` port). Any configuration can be changed later.

```markdown
owvision initialize <interface-name>
```

You can temporary disconnect using `owvision <station-name> disconnect`.
Reconnecting is possible using `owvision <station-name> connect`.
To delete the whole configuration and data use `owvision <station-name> delete`. Use `owvision <station-name> prune` to only clear the recorded weather data.

### Listing all stations

```markdown
owvision stations
```

This command lists all connected weather stations with some additional information.

### Listing all sensors of a station

```markdown
owvision station <station-name> sensors
```

This command lists all sensors of a weather station with some additional information.

### Reading the value of all sensors of a station

```markdown
owvision station <station-name> sensors read
```

This command lists the most recently recorded value (and unit) of every sensor of the specified weather station.

### Getting additional information about a sensor

```markdown
owvision station <station-name> sensor <sensor-name>
```

This command gets some additional information about the specified sensor.

### Reading a sensors value

```markdown
owvision station <station-name> sensor <sensor-name> read
```

This command lists the most recently recorded value (and unit) of the specified sensor.

### Getting a daily / monthly / ... summary

```markdown
owvision station <station-name> summary <daily/monthly/....>
```

This command prints out the latest summary for the given interval.

### Listing all extra commands available on your weather station

Some interfaces offer extra commands that you can execute on your weather station. E.g. a command to turn on the weather station's console backlight. To list all extra commands run:

```markdown
owvision station <station-name> commands
```

### Executing a command on your weather station

Executing a command is quite straightforward:

```markdown
owvision station <station-name> exec <command> [OPTIONS ...]
```
