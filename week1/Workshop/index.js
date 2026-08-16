/*
// TASK1
console.log("Hello world, Node.js!");
*/

/*
// TASK2

// // Create an indexed array of 5 nums and log it ot console
// const nums = [1, 2, 3, 4, 5];
// const msg1 = "1. Create an indexed array of 5 nums and log it ot console >> ";
// console.log(msg1, nums);

// // Push a number to the end of nums
// nums.push(99);
// const msg2 = "2. Push a number to the end of nums >>";
// const code2 = "nums.push(99); ==";
// console.log(msg2, code2, nums);

// // Add a number to the beginning of the array
// nums.unshift(0);
// const msg3 = "3. Add a number to the beginning of the array >>";
// const code3 = "nums.unshift(0); ==";
// console.log(msg3, code3, nums);

// // Add new item after the item in 3rd position
// nums.splice(2, 1, 88);
// const msg4 = "4. Add new item after the item in 3rd position >>";
// const code4 = "nums.splice(2,1,88); ==";
// console.log(msg4, code4, nums);

// // Remove last num from array
// nums.pop();
// const msg5 = "5. Remove last num from array >>";
// const code5 = "nums.pop(); ==";
// console.log(msg5, nums);

// // 6. Remove the 2nd num
// const msg6 = "6. Remove the 2nd num >> ";
// const code6 = "nums.splice(1,1); ==";
// nums.splice(1, 1);
// console.log(msg6, code6, nums);

// // 7.
// const msg7 = "7. Edit the 5th element in the array to have a value of 100";
// const code7 = "nums[4] = 100;";
// nums[4] = 100;
// console.log(msg7, code7, nums);

// const [msg8, code8] = ["8. Sort the array in ascending order", "nums.sort(a,b=>b-a)"];
// nums.sort((a, b) => a - b);
// console.log(msg8, code8, nums);
*/

/*
// TASK 3

// Create a javascript object with a key of people and a value that is an array of 3 objects each with a firstname and lastname

const obj = {
	people: [
        {
            firstName: "alice",
            lastName: "allson",
        },
        {
            firstName: "bob",
            lastName: "billabong",
        },
        {
            firstName: "charlie",
            lastName: "chaplin",
        },
    ],
};
console.log("1. JavaScript object:", obj);

const json = JSON.stringify(obj);
console.log("2. JSON object:", json);

const newObj = JSON.parse(json);
console.log("3. transmitted JSON parsed back to JS:", newObj);
*/

// TASK 4 - NPM packages
// npm install array-add-num
const arrayAdd = require('array-add-num').default;

const nums = [5, 4, 3, 8];
console.log("Sum of the array is:", arrayAdd(nums));
