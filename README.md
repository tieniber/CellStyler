# Cell Styler
A Mendix widget for styling cells or rows a data grid. You can achieve highlighting on rows or columns of a datagrid like this:

![Screenshot 1](/assets/screenshot1.png)

## Configuration
The cell styler widget requires a little bit of JavaScript knowledge to configure. Here's how it is done:

 - Grid Name: grab the value of the Name property of your data grid and enter it here
 - Rules: these are the styling rules. You will configure one or more here
   - Column Name (optional): if you want to style a specific cell (`<td>`), grab the name of the cell's column and enter it here. If you'd prefer to apply a style to the whole row (`<tr>`), leave this blank
   - Class to Apply: enter the CSS class you'd like to apply to this row or column
   - Rule JavaScript: a snippet of JavaScript that returns true when you want to apply the CSS class. You have 2 JS objects avilable to you when this function runs: `rowObj` and `contextObj` See below for examples.

## Example Configuration

> Note: you must include the attributes you'll be comparing in your grid. You can do this and avoid displaying them by setting their column's width to 0% from the data grid properties window

### Flag where the row's attribute _Name_ is "Scooter"
 
```javascript
return rowObj.get("Name") === "Scooter";
```

### Flag where the row's attribute _Name_ matches the context entity's attribute _Name_

```javascript
return rowObj.get("Name") === contextObj.get("Name");
```

### Flag where the row's attribute _DateOfBirth_ is over 1 year from the current date

```javascript
var now = new Date();
var oneYrAgo = new Date();
oneYrAgo.setYear(now.getFullYear() - 1);
return rowObj.get("DateOfBirth") < oneYrAgo;
```

### Flag where the a row's associated object _Store_ has an attribute _Name_ that contains "Emporium"

```javascript
var store = rowObj.getChildren("MyFirstModule.Pet_Store")[0];
return store.get("Name").includes("Emporium");
```

## Future Development

This widget is a perfect use case for Nanoflows. As soon as they become runnable from a custom widget, they should be used here instead of JS.
