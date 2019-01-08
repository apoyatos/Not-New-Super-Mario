'use strict';

var PlayScene = require('./play_scene.js');

var BootScene = {
  preload: function () {
    this.game.load.spritesheet('odyssey', 'images/Odyssey.png', 140, 192);
  },
  create: function () {
    this.game.forceSingleUpdate = true;
    this.game.state.start('preloader');
  }
};

var PreloaderScene = {
  preload: function () {
    //Color del fondo y volumen
    this.game.stage.backgroundColor = 0x4488aa;
    this.game.sound.volume = 0.5;
    //Imagen de carga
    this.odyssey = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'odyssey');
    this.odyssey.anchor.setTo(0.5, 0.5);
    this.load.setPreloadSprite(this.odyssey);
    //Imagenes:

    //Menu
    this.game.load.image('logo', 'images/Logo.png');
    this.game.load.image('credits', 'images/Credits.png');
    this.game.load.spritesheet('start', 'images/Start.png', 306, 56);
    this.game.load.spritesheet('options', 'images/Options.png', 306, 56);
    //Menu pausa y opciones
    this.game.load.image('pause', 'images/MenuPausa.png');
    this.game.load.spritesheet('continue', 'images/Continue.png', 306, 56);
    this.game.load.spritesheet('exit', 'images/Exit.png', 306, 56);
    this.game.load.spritesheet('volume', 'images/Volumen.png', 56, 56);
    //Tutorial-Imagenes
    this.game.load.image('andar', 'images/tutorial/Andar.png');
    this.game.load.image('agacharse', 'images/tutorial/Agacharse.png');
    this.game.load.image('rodar', 'images/tutorial/Rodar.png');
    this.game.load.image('saltar', 'images/tutorial/Saltar.png');
    this.game.load.image('impulso', 'images/tutorial/Impulso.png');
    this.game.load.image('lanzarCappy', 'images/tutorial/LanzarCappy.png');
    this.game.load.image('goombaTutorial', 'images/tutorial/Goomba.png');
    this.game.load.image('goombaMarioTutorial', 'images/tutorial/GoombaMario.png');
    this.game.load.image('goombaTorreTutorial', 'images/tutorial/GoombaTorre.png');
    this.game.load.image('chompCargadoTutorial', 'images/tutorial/ChompCargado.png');
    //Tutorial-Teclas
    this.game.load.image('arriba', 'images/tutorial/Arriba.png');
    this.game.load.image('abajo', 'images/tutorial/Abajo.png');
    this.game.load.image('izquierda', 'images/tutorial/Izquierda.png');
    this.game.load.image('derecha', 'images/tutorial/Derecha.png');
    this.game.load.image('espacio', 'images/tutorial/Espacio.png');
    this.game.load.image('shift', 'images/tutorial/Shift.png');
    this.game.load.image('z', 'images/tutorial/Z.png');
    this.game.load.image('x', 'images/tutorial/X.png');
    //Objetos del mapa
    this.game.load.image('block', 'images/Bloque.png');
    this.game.load.spritesheet('superBlock', 'images/SuperBloque.png', 34, 32);
    this.game.load.spritesheet('coin', 'images/Moneda.png', 15, 16);
    this.game.load.spritesheet('superCoin', 'images/SuperMoneda.png', 16, 16);
    this.game.load.image('heart', 'images/Corazon.png');
    this.game.load.image('superHeart', 'images/SuperCorazon.png');
    this.game.load.image('moon', 'images/Energiluna.png');
    this.game.load.spritesheet('checkpoint', 'images/Bandera.png', 26, 32);
    //Mario, enemigos e interfaz
    this.game.load.atlas('mario', 'images/Mario.png', 'images/Mario.json');
    this.game.load.spritesheet('cappy', 'images/Gorra.png', 16, 8);
    this.game.load.spritesheet('life', 'images/Vida.png', 56, 55);
    this.game.load.spritesheet('moonsHUD', 'images/EnergilunaHUD.png', 25, 22);
    this.game.load.atlas('goomba', 'images/Goomba.png', 'images/Goomba.json');
    this.game.load.spritesheet('spiny', 'images/Spiny.png', 19, 16);
    this.game.load.spritesheet('plant', 'images/PlantaPiraña.png', 18, 34);
    this.game.load.spritesheet('fireball', 'images/Disparo-Fuego.png', 9, 9);
    this.game.load.spritesheet('chomp', 'images/Chomp.png', 38, 29);
    this.game.load.spritesheet('chompBoss', 'images/ChompBoss.png', 38, 29);
    this.game.load.spritesheet('boss', 'images/MadameBroode.png', 115, 145);
    this.game.load.image('t-rex', 'images/T-Rex.png');
    //Mapa
    this.game.load.tilemap('tilemap', 'tilemaps/Nivel1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles1', 'tilemaps/Tileset1.png');
    this.game.load.image('tiles2', 'tilemaps/Tileset2.png');
    //Sonidos:

    //Menu
    this.game.load.audio('start', 'audio/Start.wav');
    this.game.load.audio('press', 'audio/Press.wav');
    this.game.load.audio('thanks', 'audio/Thanks.wav');
    //Mario
    this.game.load.audio('jump', 'audio/Jump.wav');
    this.game.load.audio('kick', 'audio/Kick.wav');
    this.game.load.audio('swim', 'audio/Swim.wav');
    this.game.load.audio('hurt', 'audio/Hurt.wav');
    this.game.load.audio('hit', 'audio/Hit.wav');
    this.game.load.audio('break', 'audio/Break.wav');
    this.game.load.audio('death', 'audio/Death.wav');
    //Cappy
    this.game.load.audio('throw', 'audio/Throw.wav');
    this.game.load.audio('capture', 'audio/Capture.wav');
    //Enemigos
    this.game.load.audio('fireball', 'audio/Fireball.wav');
    this.game.load.audio('kill', 'audio/Kill.wav');
    this.game.load.audio('chomp', 'audio/Chomp.wav');
    this.game.load.audio('boss', 'audio/MadameBroode.wav');
    this.game.load.audio('bossDeath', 'audio/MadameBroodeDeath.wav');
    //Objetos
    this.game.load.audio('coin', 'audio/Coin.wav');
    this.game.load.audio('heart', 'audio/Heart.wav');
    this.game.load.audio('moon', 'audio/Moon.wav');
    this.game.load.audio('checkpoint', 'audio/Checkpoint.wav');
    //Nivel
    this.game.load.audio('level', 'audio/LevelTheme.wav');
    this.game.load.audio('battle', 'audio/BattleTheme.wav');
    this.game.load.audio('win', 'audio/Win.wav');
  },
  create: function () {
    this.game.state.start('menu');
  }
};

var Menu = {
  create: function () {
    //Sonidos
    this.clicked = false;
    this.startSound = this.game.add.audio('start');
    this.pressSound = this.game.add.audio('press');
    //Logo del juego
    this.logo = this.game.add.sprite(0, 0, 'logo');
    this.logo.scale.setTo(2, 2);
    this.logo.anchor.setTo(-1, -0.2);
    //Botón Start
    this.buttonPlay = this.game.add.button(0, 0, 'start', Play, this, 0, 2, 1);
    this.buttonPlay.scale.setTo(1.5, 1.5);
    this.buttonPlay.anchor.setTo(-0.4, -4);

    function Play() {
      if (!this.clicked) {
        this.clicked = true;
        this.startSound.play();
        this.startSound.onStop.add(function () {
          this.game.state.start('tutorial');
        }, this);
      }
      this.clicked = false;
    }
    //Botón Options
    this.buttonOptions = this.game.add.button(0, 0, 'options', Options, this, 0, 2, 1);
    this.buttonOptions.scale.setTo(1.5, 1.5);
    this.buttonOptions.anchor.setTo(-0.4, -5.2);

    function Options() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start('options', true, false, 'menu');
        }, this);
      }
      this.clicked = false;
    }
  }
};

var Options = {
  init: function (scene) {
    this.scene = scene;
  },
  create: function () {
    //Sonidos
    this.clicked = false;
    this.pressSound = this.game.add.audio('press');
    //Logo del juego
    this.logo = this.game.add.sprite(0, 0, 'logo');
    this.logo.scale.setTo(2, 2);
    this.logo.anchor.setTo(-1, -0.2);
    //Volumen
    this.text = this.game.add.text(0, 0, 'VOLUME ' + Math.round(this.game.sound.volume * 100), { fill: 'white', font: '30px arial' });
    this.text.anchor.setTo(-1.85, -9);
    //Botón bajar volumen
    this.downVolume = this.game.add.button(0, 0, 'volume', VolDown, this, 0, 4, 2);
    this.downVolume.scale.setTo(1.5, 1.5);
    this.downVolume.anchor.setTo(-0.6, -4);
    //Botón subir volumen
    this.upVolume = this.game.add.button(0, 0, 'volume', VolUp, this, 1, 5, 3);
    this.upVolume.scale.setTo(1.5, 1.5);
    this.upVolume.anchor.setTo(-8, -4);
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(1.5, 1.5);
    this.buttonExit.anchor.setTo(-0.4, -5.2);

    function Exit() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start(this.scene);
        }, this);
      }
      this.clicked = false;
    }

    function VolDown() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.game.sound.volume = this.game.sound.volume - 0.05;
        this.text.text = 'VOLUME ' + Math.round(this.game.sound.volume * 100);
      }
      this.clicked = false;
    }
    function VolUp() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.game.sound.volume = this.game.sound.volume + 0.05;
        this.text.text = 'VOLUME ' + Math.round(this.game.sound.volume * 100);
      }
      this.clicked = false;
    }
  }
};

var Tutorial = {
  create: function () {
    //Sonidos
    this.clicked = false;
    this.pressSound = this.game.add.audio('press');
    //Movimientos de Mario
    this.imagenesMario = this.game.add.group();
    this.textoMario = this.game.add.group();
    this.teclasMario = this.game.add.group();
    //Andar
    this.imagenesMario.add(this.andar = this.game.add.sprite(0, 0, 'andar'));
    this.andar.anchor.setTo(-10, -1);
    //Texto
    this.textoMario.add(this.textAndar1 = this.game.add.text(0, 0, 'Walk', { fill: 'white', font: '30px arial' }));
    this.textAndar1.anchor.setTo(-1, -1.8);
    this.textoMario.add(this.textAndar2 = this.game.add.text(0, 0, 'or', { fill: 'white', font: '30px arial' }));
    this.textAndar2.anchor.setTo(-20.5, -1.8);
    //Teclas
    this.teclasMario.add(this.andarTecla1 = this.game.add.sprite(0, 0, 'izquierda'));
    this.andarTecla1.anchor.setTo(-10.5, -1.5);
    this.teclasMario.add(this.andarTecla2 = this.game.add.sprite(0, 0, 'derecha'));
    this.andarTecla2.anchor.setTo(-14.5, -1.5);
    //Agacharse
    this.imagenesMario.add(this.agacharse = this.game.add.sprite(0, 0, 'agacharse'));
    this.agacharse.anchor.setTo(-11.5, -4);
    //Texto
    this.textoMario.add(this.textAgacharse1 = this.game.add.text(0, 0, 'Crouch', { fill: 'white', font: '30px arial' }));
    this.textAgacharse1.anchor.setTo(-0.6, -3.6);
    this.textoMario.add(this.textAgacharse2 = this.game.add.text(0, 0, '+ Walk', { fill: 'white', font: '30px arial' }));
    this.textAgacharse2.anchor.setTo(-6, -3.6);
    //Tecla
    this.teclasMario.add(this.agacharseTecla = this.game.add.sprite(0, 0, 'abajo'));
    this.agacharseTecla.anchor.setTo(-11, -3.2);
    //Rodar
    this.imagenesMario.add(this.rodar = this.game.add.sprite(0, 0, 'rodar'));
    this.rodar.anchor.setTo(-8.4, -6);
    //Texto
    this.textoMario.add(this.textRodar1 = this.game.add.text(0, 0, 'Roll', { fill: 'white', font: '30px arial' }));
    this.textRodar1.anchor.setTo(-1.4, -5.8);
    this.textoMario.add(this.textRodar2 = this.game.add.text(0, 0, '+', { fill: 'white', font: '30px arial' }));
    this.textRodar2.anchor.setTo(-28, -5.8);
    this.textoMario.add(this.textRodar3 = this.game.add.text(0, 0, '+ Walk', { fill: 'white', font: '30px arial' }));
    this.textRodar3.anchor.setTo(-6.8, -5.8);
    //Teclas
    this.teclasMario.add(this.rodarTecla1 = this.game.add.sprite(0, 0, 'shift'));
    this.rodarTecla1.anchor.setTo(-8.4, -5.2);
    this.teclasMario.add(this.rodarTecla2 = this.game.add.sprite(0, 0, 'abajo'));
    this.rodarTecla2.anchor.setTo(-12.5, -5.2);
    //Saltar
    this.imagenesMario.add(this.saltar = this.game.add.sprite(0, 0, 'saltar'));
    this.saltar.anchor.setTo(-10, -6);
    //Texto
    this.textoMario.add(this.textSaltar = this.game.add.text(0, 0, 'Jump', { fill: 'white', font: '30px arial' }));
    this.textSaltar.anchor.setTo(-0.85, -8);
    //Tecla
    this.teclasMario.add(this.saltarTecla = this.game.add.sprite(0, 0, 'espacio'));
    this.saltarTecla.anchor.setTo(-2, -7.2);
    //Impulso
    this.imagenesMario.add(this.impulso = this.game.add.sprite(0, 0, 'impulso'));
    this.impulso.anchor.setTo(-8.4, -7.8);
    //Texto
    this.textoMario.add(this.textImpulso1 = this.game.add.text(0, 0, 'Tackle', { fill: 'white', font: '30px arial' }));
    this.textImpulso1.anchor.setTo(-0.75, -10.2);
    this.textoMario.add(this.textImpulso2 = this.game.add.text(0, 0, '+', { fill: 'white', font: '30px arial' }));
    this.textImpulso2.anchor.setTo(-36, -10.5);
    //Tecla
    this.teclasMario.add(this.impulsoTecla1 = this.game.add.sprite(0, 0, 'espacio'));
    this.impulsoTecla1.anchor.setTo(-1.7, -9.5);
    this.teclasMario.add(this.impulsoTecla2 = this.game.add.sprite(0, 0, 'arriba'));
    this.impulsoTecla2.anchor.setTo(-16, -9.5);

    this.imagenesMario.forEach(function (item) {
      item.scale.setTo(2, 2);
    }, this);
    this.teclasMario.forEach(function (item) {
      item.scale.setTo(0.75, 0.75);
    }, this);

    //Capturas Mario
    this.imagenesCappy = this.game.add.group();
    this.textoCappy = this.game.add.group();
    this.teclasCappy = this.game.add.group();
    //Lanzar
    this.imagenesCappy.add(this.lanzar = this.game.add.sprite(0, 0, 'lanzarCappy'));
    this.lanzar.anchor.setTo(-1.85, -1.2);
    //Texto
    this.textoCappy.add(this.textLanzar1 = this.game.add.text(0, 0, 'Throw', { fill: 'white', font: '25px arial' }));
    this.textLanzar1.anchor.setTo(-1.2, -1.8);
    this.textoCappy.add(this.textLanzar2 = this.game.add.text(0, 0, 'You can jump on Cappy', { fill: 'white', font: '15px arial' }));
    this.textLanzar2.anchor.setTo(-2.2, -6);
    //Tecla
    this.teclasCappy.add(this.lanzarTecla = this.game.add.sprite(0, 0, 'z'));
    this.lanzarTecla.anchor.setTo(-12.5, -1.5);
    //Pausa
    //Texto
    this.textoCappy.add(this.textPausa = this.game.add.text(0, 0, 'Pause', { fill: 'white', font: '25px arial' }));
    this.textPausa.anchor.setTo(-1.2, -6);
    //Tecla
    this.teclasCappy.add(this.pausaTecla = this.game.add.sprite(0, 0, 'x'));
    this.pausaTecla.anchor.setTo(-12.5, -4.5);
    //Torre Goomba
    this.imagenesCappy.add(this.goombaTorre = this.game.add.sprite(0, 0, 'goombaTorreTutorial'));
    this.goombaTorre.anchor.setTo(-5.5, -2.8);
    //Texto
    this.textoCappy.add(this.textgoombaTorre1 = this.game.add.text(0, 0, 'Goomba Tower', { fill: 'white', font: '25px arial' }));
    this.textgoombaTorre1.anchor.setTo(-0.2, -9.5);
    this.textoCappy.add(this.textGoombaTorre2 = this.game.add.text(0, 0, 'jump on', { fill: 'white', font: '25px arial' }));
    this.textGoombaTorre2.anchor.setTo(-5.8, -9.5);
    //Imagenes
    this.imagenesCappy.add(this.goomba1 = this.game.add.sprite(0, 0, 'goombaMarioTutorial'));
    this.goomba1.anchor.setTo(-8.5, -5.8);
    this.imagenesCappy.add(this.goomba2 = this.game.add.sprite(0, 0, 'goombaTutorial'));
    this.goomba2.anchor.setTo(-14, -6.8);
    //Chomp cargado
    this.imagenesCappy.add(this.chompCargado = this.game.add.sprite(0, 0, 'chompCargadoTutorial'));
    this.chompCargado.anchor.setTo(-2.2, -6.5);
    //Texto
    this.textoCappy.add(this.textChomp1 = this.game.add.text(0, 0, 'Charge Chomp', { fill: 'white', font: '25px arial' }));
    this.textChomp1.anchor.setTo(-0.2, -12);
    this.textoCappy.add(this.textChomp2 = this.game.add.text(0, 0, 'Move until reaching one side', { fill: 'white', font: '25px arial' }));
    this.textChomp2.anchor.setTo(-1.5, -12);

    this.imagenesCappy.forEach(function (item) {
      item.scale.setTo(2, 2);
      item.kill();
    }, this);
    this.teclasCappy.forEach(function (item) {
      item.scale.setTo(0.75, 0.75);
      item.kill();
    }, this);
    this.textoCappy.forEach(function (item) {
      item.kill();
    }, this);

    //Botón Continue
    this.count = 1;
    this.buttonContinue = this.game.add.button(0, 0, 'continue', Continue, this, 0, 2, 1);
    this.buttonContinue.scale.setTo(1.5, 1.5);
    this.buttonContinue.anchor.setTo(-0.4, -5.8);

    function Continue() {
      if (!this.clicked) {
        if (!this.clicked) {
          this.clicked = true;
          this.pressSound.play();
          this.pressSound.onStop.add(function () {
            if (this.count == 1) {
              this.count++;
              this.imagenesMario.forEach(function (item) {
                item.kill();
              }, this);
              this.textoMario.forEach(function (item) {
                item.kill();
              }, this);
              this.teclasMario.forEach(function (item) {
                item.kill();
              }, this);
              this.imagenesCappy.forEach(function (item) {
                item.revive();
              }, this);
              this.textoCappy.forEach(function (item) {
                item.revive();
              }, this);
              this.teclasCappy.forEach(function (item) {
                item.revive();
              }, this);
            }
            else if (this.count == 2) {
              this.count++;
              this.imagenesCappy.forEach(function (item) {
                item.kill();
              }, this);
              this.textoCappy.forEach(function (item) {
                item.kill();
              }, this);
              this.teclasCappy.forEach(function (item) {
                item.kill();
              }, this);
            }
            else
              this.game.state.start('play');
          }, this);
        }
        this.clicked = false;
      }
    }
  }
}

var Win = {
  create: function () {
    //Logo del juego
    this.logo = this.game.add.sprite(this.game.width / 3, 600, 'logo');
    this.logo.scale.setTo(2, 2);
    //Créditos
    this.game.add.text(this.game.width / 4, 600 + this.logo.width + 50, 'Developed by Odyssey Studios', { fill: 'white', font: '30px arial' });
    this.game.add.text(this.game.width / 4, 600 + this.logo.width + 100, 'Ismael Fernández Pereira', { fill: 'white', font: '30px arial' });
    this.game.add.text(this.game.width / 4, 600 + this.logo.width + 140, 'Álvaro Poyatos Morate', { fill: 'white', font: '30px arial' });
    this.game.add.text(this.game.width / 4, 600 + this.logo.width + 190, 'Facultad de Informatica UCM', { fill: 'white', font: '30px arial' });
    //Agradecimiento final
    this.thanks = this.game.add.sprite(this.game.width / 3, 600 + this.logo.width + 330, 'credits');
    this.thanks.scale.setTo(2, 2);
    //Sonidos
    this.clicked = false;
    this.played = false;
    this.pressSound = this.game.add.audio('press');
    this.thanksSound = this.game.add.audio('thanks');
    //Botón Exit
    this.buttonExit = this.game.add.button(0, 0, 'exit', Exit, this, 0, 2, 1);
    this.buttonExit.scale.setTo(1.5, 1.5);
    this.buttonExit.anchor.setTo(-0.4, -5.2);
    this.buttonExit.visible = false;

    function Exit() {
      if (!this.clicked) {
        this.clicked = true;
        this.pressSound.play();
        this.pressSound.onStop.add(function () {
          this.game.state.start('menu');
        }, this);
      }
      this.clicked = false;
    }
  },
  update: function () {
    this.game.world.forEach(function (element) {
      element.y -= 1;
    });
    if (this.thanks.bottom < 600 && !this.played) {
      this.thanksSound.play();
      this.thanksSound.onStop.add(function () {
        this.buttonExit.visible = true;
      }, this);
      this.played = true;
    }
    this.buttonExit.y += 1;
  }
};

window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('menu', Menu);
  game.state.add('options', Options);
  game.state.add('tutorial', Tutorial);
  game.state.add('play', PlayScene);
  game.state.add('win', Win);

  game.state.start('boot');
};