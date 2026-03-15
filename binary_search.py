def binary_search(arr, target):
    """
    Performs binary search on a sorted array to find the target value.
    
    Args:
        arr: A sorted list of elements
        target: The value to search for
        
    Returns:
        The index of the target value if found, otherwise -1
    """
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1


# Example usage
if __name__ == "__main__":
    # Test array (must be sorted)
    test_array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    
    # Test cases
    print(f"Searching for 7 in {test_array}: Index {binary_search(test_array, 7)}")
    print(f"Searching for 4 in {test_array}: Index {binary_search(test_array, 4)}")
    print(f"Searching for 19 in {test_array}: Index {binary_search(test_array, 19)}")
    print(f"Searching for 1 in {test_array}: Index {binary_search(test_array, 1)}")
    
    # Test with unsorted array (should work correctly)
    unsorted_array = [5, 2, 8, 1, 9]
    sorted_array = sorted(unsorted_array)
    print(f"\nUnsorted array: {unsorted_array}")
    print(f"Sorted array: {sorted_array}")
    print(f"Searching for 8 in sorted array: Index {binary_search(sorted_array, 8)}")
    
    # Test edge cases
    print(f"Searching in empty array: Index {binary_search([], 5)}")
    print(f"Searching for value not in array: Index {binary_search([1, 2, 3], 4)}")
```