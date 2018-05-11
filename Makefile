DRYRUN=-n

deploy:
	mkdir -p app/img app/js app/css
	cp assets/img/*.png app/img/
	cp assets/js/* app/js/
	cp src/css/* app/css/
	cp src/js/* app/js/
	sed "s/@@VERSION@@/`cat src/VERSION`/g" < src/index.html > app/index.html
	sed "s/@@VERSION@@/`cat src/VERSION`/g" < src/sw.js > app/sw.js

clean:
	rm -rf app

interactive:
	ag -l . src | entr make deploy

publish:
	rsync $(DRYRUN) -var --delete app/ aws:/space/web/wordclock/
