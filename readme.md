## Initialization
1. Copy the files in the "auto-suggesstion" folder and import them to the project.
2. The "auto-suggestion" requires jquery so remember to import the jquery first.
3. The auto-suggestion could be attached to any input element by calling the script: 
    ```
     $('[element-selector]').autoSuggestion({
        url: 'url',
        key: 'search',
     });
    ```
    Element-selector should be replaced by any valid jquery selector (such as ".class-element", "#id-element",...).
    Url should be replaced with a valid API URL. Everytime the user typing, the API with the format `url?key={value}` will be called 
4. The auto-suggestion could be customized by calling with an object contains the customized properties
    ```
    $('[element-selector]').autoSuggestion({
        url: 'url',
        key: 'search',
        triggerNoKey: 2,
    });
    ```
## Customization
Auto-suggestion supports those customized features below. 

| Property | Required | Description | Type of value | Default Value |
|---|---|---|---|---|
| url | * | link to the API to trigger the data | string |  |
| key |  | key to be attached as params for API query | `string` | `search` |
| triggerNoKey |  | Number of typed keys to trigger the API | `number` | `1` |
| blocks |  | Keys of groups will be displayed in the suggestion popup (should be matched with the keys of the data response) | `Array` | `['term', 'collection', 'product']` |
| customWrapperClasses |  | CSS class name of the auto-suggestion popup | `Array` |  |
| renderItem |  | Function to render the item. Params for this function will be *item*(contains the data of that item) and *group*(contains the data of the group that the item is belonged to) | `function(item, group) => Element` | `function` |
| renderGroup |  | Function to render the group. Params for this function will be *group* (contains the data of the group) | `function(group) => Element` | `function` |
| renderViewmore |  | Function to render the view more section | `function() => Element` | `function` |
| viewMoreUrl |  | URL of the view more link | `string` |  |