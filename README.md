Django back-end API with Bootstrap and jQuery front-end for web-development module

## Models   
- Developer
  - Name (charField)  
  - Bio (textField)  
  - Price (decimalField)  
- Project  
  - Title (charField)  
  - Developers (ManyToMany)  
  - Bugdet (decimalField)  
