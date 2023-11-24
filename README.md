
# Simon's Editor: Code Mirror in Typescript

Mini-project I made to both learn "Typescript" and edit my documents for Simon's Lab.


## Demo

You can access the [Prototype Demo](https://ssenseii.github.io/simons-editor-prototype/) right here.



## Documentation

This prototype works by parsing each line and changing it from markdown to HTML.

It parses each line as a paragraph "< p >" tag by default.

If you add one of the modifiers down below at the start of the line, it'll parse it as its according tag. 

### Operational tags:

- "#" for H1
- "##" for H2
- "###" for H3
- "---" for Horizontal Rule
- "code" for < code >.
- "li" for list item
- "br" for line break 



## FAQ

#### How do I add my own custom modifiers?

You can add your own modifiers by adding a few lines of code to the **script.ts** file and recompiling it.

- Step 1: Add a new Enum for the tag you want to add, for example, **Header4**
- Step 2: Create a class Visitor for the Tag you want:

```javascript
class Header4Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header4, new tagTypeToHtml());
  }
}
```
- Step 3: Create a chain handler class for your tag with the appropriate HTML tag for it
```javascript 
class Header1ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "#### ", new Header4Visitor());
  }
}
```
- Step 4: Create a tag modifier for the start of the line in the "tagTypeToHtml" class matching the Markdown equivalent or the HTML tag.
```javascript
this.tagType.set(TagType.Header4, "h4");
```
- Step 5: And that's it actually !!! you've done it and now you have your own working tag
- Extra Step: I have my own react class hard set in the code for the tags you can change it by modifying this part of the code
```javascript 
private GetTag(tagType: TagType, openingTagPattern: string) { 
    let tag = this.tagType.get(tagType); 
    if (tag !== null) {  
      return `${openingTagPattern}${tag} classname='instruction__${tag}'>`;                              
    }                                           
    return `${openingTagPattern}p>`;                                          
  }
}
```

#### Why not add all the html tags yourself?

I would love to, but I have to manage my time accordingly. I only wanted to create a code mirror to easily add documentation to my website. 

#### Why not use already existing code mirrors?

A fun challenge to make one yourself, like creating your own game engine. I feel better about myself when I make something and use it.

#### How to use it?

- write your markdown in the green space
- when finished, click "copy to clipboard"
- paste the HTML code inside the appropriate div in the docs.jsx component in simonslab


## Used By

This project is used by the following companies:

- SimonsLab


## Screenshots

![App Screenshot](https://i.ibb.co/gyQDn92/image.png)




