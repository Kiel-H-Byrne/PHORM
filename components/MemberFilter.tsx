
import { Button, Input, Select } from '@chakra-ui/react'
import { useState } from 'react'

export default function MemberFilter() {

  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = () => {
    // filter member list
  }

  return (
    <div>
      <Input 
        placeholder="Search members"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}  
      />
      <Select placeholder="Select location" value={location} onChange={e => setLocation(e.target.value)}>
        <option value="DC">Washington, DC</option>
        <option value="MD">Maryland</option>  
        <option value="VA">Virginia</option>
      </Select>
      <Button onClick={handleSearch}>Search</Button>
    </div>
  )
}
