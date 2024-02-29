# Business logic

## Introduction
This application is meant for use by restaurants and their customers to facilitate the orderning of meals at restaurants. The hierarchy of components is as follows: Menus, Menu Items, Ingredients. We'll look at them from a bottom-up approach

### Ingredients
These are the base form of what is used to make dishes, what you cut, wash, peel etc while preparing for a meal e.g. carrots, flour, tomatos, eggs etc

### Menu Items
These are dishes that are created using the ingredients as a base e.g. pilau from rice and masala

### Menus
These are collections of menu items to form different classes of meals for different times, moods and cuisines e.g. breakfast, dessert, Ethiopian etc

## Flow
1. Customer creates account
2. Customer searches for and requests dish
3. Restaurant receives order and prepares dish
4. Restaurant marks order as complete
 