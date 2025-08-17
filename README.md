# core

<hr>

🪄 Moved to [mono repo](https://github.com/open-weather-vision/owvision).

<hr>

This repository contains the _official open weather vision (owvision) core engine_. This includes the **REST api** together with the corresponding **CLI** and the **abstract recorder interface**, which can be used to connect any weather station and any sensor.

⚠️ Development just started - there is no offical version yet.
View latest development updates on the [dev branch](https://github.com/open-weather-vision/core/tree/dev).

![Overview](./core-diagram.svg)
_This image shows an overview of the open weather vision system_. Every red component is a docker container.

## CLI Usage

The `owvision` cli is an easy tool to manage and configure your weather stations. Internally it just calls the endpoints of the REST api.

### Initial Set Up

There are two different setups possible:

**Setup A**: the owvision api and the recorder are on the same host

**Setup B**. the owvision api and the recorder are on a different host

In the following sections _main host_ refers to the host hosting the api.
_recorder host_ refers to the host recording the weather data.

#### Setup A (all on one host)

##### 1. Install The Interface

owvision needs an interface that allows it to communicate with your weather station. This interface is basically a single javascript file that extends the _WeatherStationInterface_ class. To register this javascript file execute:

```markdown
owvision register-interface <path-to-js-file> <interface-name>
```

Trusted interfaces are listed [here]().

##### 2. Connect (And Configure) Your Weather Station

After that you can use this interface to connect to your weather station. You have to give your station a name and you can select your favorite units. Added to that you can set each sensor's update times. Your selected interface may require more configuration (e.g. a `COM` port). Any configuration can be changed later.

```markdown
owvision initialize <interface-name>
```

You can temporary disconnect using `owvision <station-name> disconnect`.
Reconnecting is possible using `owvision <station-name> connect`.
To delete the whole configuration and data use `owvision <station-name> delete`. Use `owvision <station-name> prune` to only clear the recorded weather data.

#### Setup B (recorder and main host)

##### 1. Install The Interface On The Main Host

owvision needs an interface that allows it to communicate with your weather station. This interface is basically a single javascript file that extends the _WeatherStationInterface_ class.

To register this javascript file execute on the main host (not the recorder host):

```markdown
owvision register-interface <path-to-js-file> <interface-name>
```

##### 2. Configure Your Weather Station

After that you can configure your weather station. You have to give your station a name and you can select your favorite units. Added to that you can set each sensor's update times. Your selected interface may require more configuration (e.g. a `COM` port). Any configuration can be changed later.

```markdown
owvision initialize --remote-recorder <interface-name>
```

##### 3. Configure And Start The Recorder

Now you can start the recorder on the recorder host.

```markdown
owvision-recorder start <main-host-url> <weather-station-name>
```

The main host url is the url to your api. It should be something like
`https://192.168.40:8000`. After that you specify the weather station's name.

##### 4. Useful commands (on the main-host)

You can temporary disconnect using `owvision <station-name> disconnect`.
Reconnecting is possible using `owvision <station-name> connect`.
To delete the whole configuration and data use `owvision <station-name> delete`. This will also delete the recorder on the recorder host. Use `owvision <station-name> prune` to only clear the recorded weather data.

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

