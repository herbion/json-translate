DIALOGUE=DialoguesLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200--6359132067312534950.json
GENERAL=GeneralLockitRussian-CAB-ad8f8cefa31b37ddead15fdfe2ae8200-6207927063058028102.json

dev:
	node release.js $(DIALOGUE) $(GENERAL) --csv --dictionary
dry:
	node release.js $(DIALOGUE) $(GENERAL) --dry
release:
	node release.js $(DIALOGUE) $(GENERAL)
