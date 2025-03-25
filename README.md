# Recharge Watch
Automatically watch for changes and sync them to recharge

### How to run
clone this repo and cd into it
```bash
git clone https://github.com/npmSteven/recharge-watch.git && cd recharge-watch.git
```

install node modules with pnpm
```bash
pnpm i
```

build
```bash
npm run build
```

To watch for changed you need to start the recharge-watch but from the project you want to sync the changes

in the below example we are in the project we want to sync the changes to recharge, then we just point --prefix to the location of the recharge-watch repo
```bash
npm run --prefix ../recharge-watch start
```

### DONE
- [x] Sync edit file
- [x] Sync delete file
- [x] Sync create file

### TODO
- [ ] Do not allow editing live theme
- [ ] Open preview of theme automically
- [ ] Automatically reload theme on change from the browser
- [ ] Before syncing changes to recharge validate that the content is valid for the content type

### NOT SUPPORTED
- [ ] We only support syncing the top level
- [ ] We only support three files types `js`, `html`, `css` and `svg`
