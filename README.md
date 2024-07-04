# core

This repository contains the _official open weather vision (owvision) core engine_. This includes
- The owvision demon (and it's cli)
- The owvision recorder (and it's cli)

⚠️ Development just started - there is no offical working version yet.

![Overview](./documentation/core-diagram.svg)
_This image shows an overview of the open weather vision system_. Every red component is a docker container.

## Setup

⚠️ _These setups are not working yet. They only show how it is going to work._

### Simple (all on one host)

#### 1. Install owvision

##### Requirements
- _docker_ must be installed and available without `sudo`

To install owvision run following command:

```console
wget https://open-weather-vision.github.io/core/simple-setup.sh -o -- | sh
```

Now you should be able to run `owvision` in your terminal. Try it out!

#### 2. Initialize owvision

After that we are ready to initialize owvision.

```console
foo@bar:~$ owvision initialize
...
✓ Is owvision running on another host?  » no
✓ Successfully initialized owvision
✓ please enter your username:  ... admin
✓ please enter your password:  ... *****
✓ Successfully logged in
```

Please choose the _recommended_ setup. The default
login username is `admin` with `admin` as password.
It is recommended to change the password via `owvision auth change-password`.

#### 3. Create your weather station

Now we are ready to create your weather station!

```bash session
foo@bar:~$ owvision station create
√ please choose the station's interface:  » Davis Vantage Advanced
√ please enter the station's name:  ... My cool station!
√ please enter the station's slug:  ... cool-station
√ are you using a remote recorder?  » no
√ please choose a temperature unit:  » °C
√ please choose a leaf temperature unit:  » °C
√ please choose a soil temperature unit:  » °C
√ please choose a precipation unit:  » in
√ please choose an evo transpiration unit:  » in
√ please choose a pressure unit:  » hPa
√ please choose an elevation unit:  » in
√ please choose a wind unit:  » km/h
√ please choose a solar radiation unit:  » W/m²
√ please choose a soil moisture unit:  » cb
√ please choose a humidity unit:  » %
✓ Created station My cool station! (cool-station)!
```

#### 4. Have fun 🥳

That's it! Now you can read from your weather station via:
```bash session
foo@bar:~$ owvision station sensor read cool-station
Inside temperature (tempIn) ❯ 23.27°C (1s ago)
Outside temperature (tempOut) ❯ -8.26°C (1s ago)
```
If you are annoyed by manually typing the station's slug again and again, select it via `owvision station select <station_slug>`.

### Advanced (distributed)

...
