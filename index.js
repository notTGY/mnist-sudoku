let modelLoaded = false
let model
const MODEL = 'mlp'
const DEBUG = true

const CELL_SIZE = 300
const MNIST_SIZE = 28
if (DEBUG) {
  preview.width = preview.height = MNIST_SIZE
}
const BRUSH_SIZE = CELL_SIZE / 15
let DIFFICULTY = 80


/*
diffInput.oninput = (e) => {
  DIFFICULTY = Number(e.target.value)
  diff.innerText = DIFFICULTY
  init()
}
*/

easy.onclick = () => {
  DIFFICULTY = 62
  //diff.innerText = DIFFICULTY
  init()
}
medium.onclick = () => {
  DIFFICULTY = 53
  //diff.innerText = DIFFICULTY
  init()
}
hard.onclick = () => {
  DIFFICULTY = 44
  //diff.innerText = DIFFICULTY
  init()
}
veryhard.onclick = () => {
  DIFFICULTY = 35
  //diff.innerText = DIFFICULTY
  init()
}

let grid = []
let ans = ''

function drawCircle(ctx, x, y, radius, fill) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
}


const init = async () => {
  if (!modelLoaded) {
    if (typeof tf !== 'undefined') {
      model = await tf.loadLayersModel(`/${MODEL}/model.json`);
    }
    modelLoaded = true
  }
  const predict = (image, X, Y) => {
    // https://stackoverflow.com/questions/61772476/tensorflow-js-uncaught-error-error-when-checking-expected-conv2d-input-to-ha
    const channels = MODEL === 'cnn' ? 4 : 1
    const example = tf.browser.fromPixels(image, channels)
    const resized = example.resizeNearestNeighbor([28, 28])
    let reshaped
    if (MODEL === 'cnn') {
      reshaped = resized.reshape([4, 28, 28, 1])
    } else {
      reshaped = resized.reshape([1, 28, 28])
    }
    //reshaped.print()
    const prediction = model.predict(reshaped).dataSync()
    const pred = tf.argMax(prediction).dataSync()[0]

    if (DEBUG) {
      tf.browser.toPixels(resized, preview)

      //console.log('prediction', pred)
      output.innerText = pred
    }

    grid[Y][X] = pred
  }

  const stringSudoku = sudoku.generate(DIFFICULTY)
  ans = sudoku.solve(stringSudoku)
  const numbers = stringSudoku.split('')

  const root = document.getElementById('root')
  root.innerHTML = ''
  let i = 0
  for (let Y = 0; Y < 9; Y++) {
    grid[Y] = []
    if (Y % 3 === 0 && Y !== 0) {
      for (let X = 0; X < 11; X++) {
        const a = document.createElement('div')
        a.className = 'placeholder'
        root.append(a)
      }
    }

    for (let X = 0; X < 9; X++) {
      const number = numbers[i]
      grid[Y][X] = number
      i++

      if (X % 3 === 0 && X !== 0) {
        const a = document.createElement('div')
        a.className = 'placeholder'
        root.append(a)
      }

      if (number !== '.') {
        const c = document.createElement('div')
        c.innerText = number
        root.append(c)

        continue
      }
      const c = document.createElement('canvas')
      root.append(c)
      const ctx = c.getContext('2d', { willReadFrequently: true })
      c.width = CELL_SIZE
      c.height = CELL_SIZE
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, c.width, c.height)
      let isDrawing = false
      const scaling = CELL_SIZE / c.offsetWidth

      const putPixel = (x, y) => {
        drawCircle(ctx, x, y, BRUSH_SIZE, '#fff')
      }

      c.onmousedown = (e) => {
        isDrawing = true
        putPixel(e.offsetX * scaling, e.offsetY * scaling)
      }
      c.onmouseup = (e) => {
        isDrawing = false
  const image = ctx.getImageData(0, 0, CELL_SIZE, CELL_SIZE)
        predict(image, X, Y)
      }
      c.onmouseleave = (e) => {
        if (isDrawing) {
          isDrawing = false
  const image = ctx.getImageData(0, 0, CELL_SIZE, CELL_SIZE)
          predict(image, X, Y)
        }
      }

      c.onmousemove = (e) => {
        if (isDrawing) {
        putPixel(e.offsetX * scaling, e.offsetY * scaling)
        }
      }

      c.ontouchstart = (e) => {
        const touches = e.changedTouches
        if (touches.length > 1) {
          return
        }
        e.preventDefault()
        const offX = (X)*c.offsetWidth + root.offsetLeft
        const offY = (Y)*c.offsetWidth + root.offsetTop
        const offsetX = (touches[0].pageX - offX) / c.offsetWidth * CELL_SIZE
        const offsetY = (touches[0].pageY - offY) / c.offsetWidth * CELL_SIZE
        isDrawing = true
        putPixel(offsetX, offsetY)
      }
      c.ontouchend = (e) => {
        e.preventDefault()
        isDrawing = false
  const image = ctx.getImageData(0, 0, CELL_SIZE, CELL_SIZE)
        predict(image, X, Y)
      }

      c.ontouchmove = (e) => {
        e.preventDefault()
        const offX = (X)*c.offsetWidth + root.offsetLeft
        const offY = (Y)*c.offsetWidth + root.offsetTop
        const touches = e.changedTouches
        const offsetX = (touches[0].pageX - offX) / c.offsetWidth * CELL_SIZE
        const offsetY = (touches[0].pageY - offY) / c.offsetWidth * CELL_SIZE
        if (isDrawing) {
          putPixel(offsetX, offsetY)
        }
  const image = ctx.getImageData(0, 0, CELL_SIZE, CELL_SIZE)
        if (DEBUG) {
          output.innerText = JSON.stringify({
            offsetX, offsetY
          })
        }
      }

    }
  }
}

init()

const checkSudoku = () => {
  const cur = sudoku.board_grid_to_string(grid)
  if (cur === ans) {
    init()
  } else {
    alert('wrong')
  }
}

check.onclick = (e) => {
  checkSudoku()
}
