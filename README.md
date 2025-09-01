# subshift  
A CLI tool to shift and adjust timecodes in `.srt` subtitle files.  
Supports single files, multiple files, or entire folders.  

- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Roadmap](#roadmap)

## Installation  

### Prerequisites 
- **Node.js** >= 16.14.0
- npm  

### Install
```bash
# 1. Clone the repo
git clone https://github.com/konradgj/subshift.git
cd subshift

# 2. Install dependencies
npm install

# 3. Build the CLI
npm run build
```
NOTE: build step might need sudo or admin privileges as it includes `npm link`

### Uninstall
```bash
npm unlink -g @subshift/cli
```
NOTE: `npm unlink` might need sudo or admin privileges

## Usage  

```bash
subshift <inputs...> [options]
```

### Arguments  
- `<inputs...>` – one or more subtitle files or directories to process  

### Options  

| Option | Required | Description |
|--------|-------|-------------|
| `-s, --shift <ms>` | required | Amount of time to shift in **milliseconds** (positive or negative) |
| `-r, --range <start-end>` |  | Apply shift only to subtitle indices (e.g. `5-10`) |
| `--from <time>` |  | Apply shift starting at this time (e.g. `00:01:23,456`) |
| `--to <time>` |  | Apply shift up to this time (e.g. `00:02:00,000`) |
| `-o, --output <file>` |  | Save to specific output file (default: overwrite input file) |
| `--outdir <dir>` |  | Save outputs in a given directory |
| `--inplace` |  | Modify the file(s) in place |
| `--dryrun` |  | Preview shifted subtitles without saving |
| `--diff` |  | Show a diff of timecode changes without saving |
| `--includehidden` |  | Include hidden files when processing directories |

---

## Examples  

### Shift a single file by +2 seconds  
```bash
subshift examples/sub1.example.srt -s 2000
```

### Shift all `.srt` files in a folder back by 500 ms  
```bash
subshift ./examples -s -500
```
### Shift files in in place  
```bash
subshift ./examples -s -500 --inplace
```

### Shift only blocks 10–20  
```bash
subshift examples/sub1.example.srt -s 1000 -r 10-20
```

### Shift between two timecodes  
```bash
subshift examples/sub1.example.srt -s 750 --from 00:01:00,000 --to 00:02:00,000
```

### Save results to a different folder  
```bash
subshift ./examples -s 1500 --outdir ./shifted-examples
```

### Preview changes without saving  
```bash
subshift examples/sub1.example.srt -s 2000 --dryrun
```

### Show a diff of changes without saving 
```bash
subshift examples/sub1.example.srt -s 2000 --diff
```


## Roadmap  
- [ ] Add support for `.vtt` subtitles  
- [ ] Smarter error recovery (skip corrupt blocks, not whole file)  
- [ ] GUI app  
